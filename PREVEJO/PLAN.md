FTechnical Implementation Plan: Group Syndicates for Centralized Markets
1. Database Architecture (The "Virtual Vault")

Delegated Authority: Alternatively, the group creator (The "MANAGER") chooses the outcome, but funds remain locked in the vault.



In a centralized system, "Group Funds" are entries in your database that represent a collective claim on an order.

    Groups Table: Stores metadata (name, creator_id, privacy_settings, min/max contribution).

    Group_Members Table: Maps users to groups with their contribution_ratio.

    Group_Orders Table: Links a group to specific market contracts. Instead of a user_id owning a "YES" share, the group_id owns it.

    Virtual_Ledger Table: Tracks internal movements. When a user contributes $100 to a $1,000 group pool, they own 10% of any future payouts from that pool.

2. The "Aggregation & Execution" Engine

Since centralized exchanges (like Kalshi) use Order Books, the group must act as a single "Market Participant."

    Phase A: The Commitment Window: Define a locking_period. Users join the group and commit funds. These funds are moved from their Personal_Balance to a Group_Escrow_Balance in your DB.

    Phase B: Consensus/Lead Execution:

        The Lead Model: The group creator (Lead) chooses the outcome (Yes/No) and the limit price.

        The Voting Model: Members vote. If 51% of the capital (not users) agrees on "YES" at $0.60, the system triggers the order.

    Phase C: Order Placement: Your backend matching engine executes one large trade using the group_id. This reduces transaction noise and simplifies fee calculation.

3. Temporary & Punctual Market Logic

For short-term markets (e.g., "Will it rain in Asuncion in the next 3 hours?"), speed is critical.

    Flash Groups: Implement "Auto-Group" features where users can join a "Public Syndicate" for a specific event that expires in <24 hours.

    Auto-Liquidation: If a group fails to reach its minimum_liquidity_threshold 15 minutes before the market starts, the backend must automatically roll back all commitments to personal balances.

    Real-time WebSocket Updates: Use WebSockets to show users the "Group Fill Status"—how close the group is to having enough money to buy the desired number of contracts.

4. Payout & Resolution Strategy

This is where the centralized model shines in terms of UX.

    Automated Pro-Rata Distribution: As soon as the market resolver (your internal admin or an API feed) marks a result:

        The system calculates the total return for the group_id.

        It applies a syndicate_fee (optional—to reward the group creator).

        It credits each member's Personal_Balance based on their contribution_ratio.

    Formula:
    User_Credit=(Group_Winnings×(1−Platform_Fee))×Total_Group_PoolUser_Contribution​

5. API & Frontend Integration (Next.js / Node.js)

    New Endpoints:

        POST /v1/groups/create (Initialize group and set rules)

        POST /v1/groups/:id/join (Commit funds)

        GET /v1/groups/:id/positions (View collective PnL)

    UI Components:

        Social Sidebar: A feed showing active groups for trending markets.

        Contribution Slider: A simple UI tool for users to see exactly what % of the group they will own based on their investment.

       # an sql example:
## 1. Core Schema Definition 
-- Enable UUID extension for secure, non-sequential IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Groups Table: The entity that acts as a collective participant
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL,
    market_id UUID NOT NULL, -- Link to your existing markets table
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_contribution DECIMAL(18, 8) DEFAULT 0,
    max_contribution DECIMAL(18, 8),
    target_liquidity DECIMAL(18, 8) NOT NULL,
    current_liquidity DECIMAL(18, 8) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open', -- open, locked, executed, resolved, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    locked_at TIMESTAMP WITH TIME ZONE -- When the group stops accepting new members
);

-- 2. Group Members: Tracking individual "Skin in the Game"
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    contribution_amount DECIMAL(18, 8) NOT NULL CHECK (contribution_amount > 0),
    ownership_percentage DECIMAL(5, 4), -- Calculated: (contribution / total_liquidity)
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 3. Group Orders: Tracking the bet placed by the group as a single entity
CREATE TABLE group_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id),
    outcome_selected VARCHAR(10) NOT NULL, -- 'YES' or 'NO'
    order_price DECIMAL(18, 8) NOT NULL,
    shares_purchased DECIMAL(18, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, filled, settled
    executed_at TIMESTAMP WITH TIME ZONE
);

## 2. Automatic Ownership Calculation
CREATE VIEW view_group_member_shares AS
SELECT 
    gm.group_id,
    gm.user_id,
    gm.contribution_amount,
    (gm.contribution_amount / g.current_liquidity) AS share_ratio
FROM group_members gm
JOIN groups g ON gm.group_id = g.id;

## 3. Atomic Transaction Example: Joining a Group

BEGIN;

-- 1. Deduct from user's main wallet (assuming a 'users' table exists)
UPDATE users 
SET balance = balance - 100.00 
WHERE id = 'user-uuid' AND balance >= 100.00;

-- 2. Add member to the group
INSERT INTO group_members (group_id, user_id, contribution_amount)
VALUES ('group-uuid', 'user-uuid', 100.00);

-- 3. Update group's total liquidity
UPDATE groups 
SET current_liquidity = current_liquidity + 100.00 
WHERE id = 'group-uuid';

COMMIT;

## Stored Procedure: resolve_group_payouts 
CREATE OR REPLACE FUNCTION resolve_group_payouts(
    target_group_id UUID,
    market_outcome VARCHAR(10), -- 'YES' ou 'NO'
    payout_per_share DECIMAL(18, 8) -- Valor pago por cada contrato vencedor (ex: 1.00)
) 
RETURNS VOID AS $$
DECLARE
    total_group_winnings DECIMAL(18, 8);
    platform_fee_percent DECIMAL(5, 4) := 0.02; -- Exemplo: taxa de 2% da plataforma
    net_winnings DECIMAL(18, 8);
    member_record RECORD;
BEGIN
    -- 1. Calcular o prêmio bruto do grupo baseado nas ordens preenchidas
    SELECT SUM(shares_purchased * payout_per_share)
    INTO total_group_winnings
    FROM group_orders
    WHERE group_id = target_group_id 
      AND outcome_selected = market_outcome
      AND status = 'filled';

    -- Se o grupo não apostou no resultado vencedor, marcar como resolvido e sair
    IF total_group_winnings IS NULL OR total_group_winnings = 0 THEN
        UPDATE groups SET status = 'resolved' WHERE id = target_group_id;
        RETURN;
    END IF;

    -- 2. Aplicar taxa da plataforma (Opcional)
    net_winnings := total_group_winnings * (1 - platform_fee_percent);

    -- 3. Loop através de cada membro para distribuir o prêmio proporcionalmente
    FOR member_record IN 
        SELECT user_id, (contribution_amount / current_liquidity) as share_ratio
        FROM group_members
        JOIN groups ON groups.id = group_members.group_id
        WHERE group_id = target_group_id
    LOOP
        -- Creditar a carteira do usuário (tabela 'users')
        UPDATE users 
        SET balance = balance + (net_winnings * member_record.share_ratio)
        WHERE id = member_record.user_id;
        
        -- Log da transação (opcional, mas recomendado)
        INSERT INTO transactions (user_id, amount, type, reference_id)
        VALUES (member_record.user_id, (net_winnings * member_record.share_ratio), 'payout', target_group_id);
    END LOOP;

    -- 4. Atualizar status final do grupo e das ordens
    UPDATE groups SET status = 'resolved', locked_at = CURRENT_TIMESTAMP WHERE id = target_group_id;
    UPDATE group_orders SET status = 'settled' WHERE group_id = target_group_id;

END;
$$ LANGUAGE plpgsql; 

##

## Stored Procedure: cancel_group_and_refund
Quando você deve chamar esta função?

    Insucesso na formação: Se o mercado começa em 5 minutos e o grupo atingiu apenas 40% da target_liquidity. Seu backend (Node.js/Python) deve disparar um cron job que chama esta função.

    Mercado Anulado: Se o evento do mercado foi cancelado (ex: jogo de futebol adiado ou evento político cancelado), você chama esta função para todos os grupos ativos naquele market_id.

    Erro de Execução: Caso a ordem do grupo não tenha sido preenchida (ex: falta de liquidez no book global), o estorno garante que o dinheiro não fique preso no limbo.

Considerações de Segurança no Postgres

    Integridade Referencial: A tabela group_members tem ON DELETE CASCADE. No entanto, como estamos lidando com dinheiro, nunca delete registros. Use sempre o status cancelled.

    Controle de Transação: Ambas as Procedures (resolve e cancel) devem ser executadas dentro de um bloco TRY/CATCH no seu backend para garantir que, se um UPDATE falhar por qualquer motivo (ex: banco fora do ar no meio do loop), toda a operação sofra rollback.


CREATE OR REPLACE FUNCTION cancel_group_and_refund(
    target_group_id UUID,
    cancellation_reason TEXT DEFAULT 'Market cancelled or liquidity not met'
) 
RETURNS VOID AS $$
DECLARE
    member_record RECORD;
BEGIN
    -- 1. Verificar se o grupo já foi resolvido ou se já está cancelado para evitar duplo estorno
    IF EXISTS (SELECT 1 FROM groups WHERE id = target_group_id AND status IN ('resolved', 'cancelled')) THEN
        RAISE EXCEPTION 'Group is already resolved or cancelled.';
    END IF;

    -- 2. Loop para devolver exatamente o valor que cada membro contribuiu
    -- Note que aqui não há cálculo de lucro, apenas a devolução do capital principal
    FOR member_record IN 
        SELECT user_id, contribution_amount 
        FROM group_members 
        WHERE group_id = target_group_id
    LOOP
        -- Devolver o saldo para a carteira principal do usuário
        UPDATE users 
        SET balance = balance + member_record.contribution_amount
        WHERE id = member_record.user_id;

        -- Registrar o estorno no log de transações
        INSERT INTO transactions (user_id, amount, type, reference_id, metadata)
        VALUES (
            member_record.user_id, 
            member_record.contribution_amount, 
            'refund', 
            target_group_id, 
            jsonb_build_object('reason', cancellation_reason)
        );
    END LOOP;

    -- 3. Atualizar o status do grupo para 'cancelled'
    UPDATE groups 
    SET status = 'cancelled', 
        description = description || ' | Cancellation Reason: ' || cancellation_reason
    WHERE id = target_group_id;

    -- 4. Cancelar quaisquer ordens pendentes vinculadas ao grupo que não foram preenchidas
    UPDATE group_orders 
    SET status = 'cancelled' 
    WHERE group_id = target_group_id AND status = 'pending';

END;
$$ LANGUAGE plpgsql;

## FINAL PLAN

Implement a button in the user panel or app to create groups and send a message to the user's WhatsApp with the link to join the group. The admin will then authorize the group for betting to begin. The group must have a limit on the number of participants and a limit on the amount per participant. This is defined by the group creator, called the manager. The user has a panel with a "Group" side menu to view the groups they belong to and the status of each one. The group can be public or private. If it's private, the user needs to be invited to join. If it's public, the user can join without being invited. The group may have a limit on the number of participants and a limit on the amount per participant. This is defined by the group creator, called the manager.
This user has the possibility to invite other users to participate in the group, and creates a marketplace for this, where all group users can participate, after authorization from the general admin and release of the group. All users must have an array of which groups they participate in, and the group must have an array of participants. Invitations are sent via WhatsApp, and the user must click on the link to join the group. The group must have a limit on the number of participants and a limit on the amount per participant. This is defined by the group's creator, called the "MANAGER".

