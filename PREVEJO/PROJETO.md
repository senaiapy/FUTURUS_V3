 You said

cria ma maravilhosa pagina em html para indicar o lancamento de um aplataforma do primeiro Mercado de Futuros predictivo no Brasil, para o dia 01 de Abril, dia da mentira, com uma belissima propaganda de marketing com o nome de PREVEJO e seu dominio e prevejo.com.br, cria tambem um logotipo e inclua na pagina, juntamente com un contador decrescente para o lancamento
Gemini said

You said

crie toda infraestrutura desta pagina assim como o registro e envio de usuarios inscritor por whatsapp para o numero 11995009969
Gemini said

Essa é uma excelente jogada de marketing. Lançar o PREVEJO no dia 1º de abril traz aquele tom de mistério e "bom demais para ser verdade" que engaja muito no setor financeiro e de tecnologia.

Para a infraestrutura, como você já domina Next.js, TypeScript e Tailwind CSS, vou estruturar o código usando essas ferramentas. Para o envio do WhatsApp, utilizaremos uma integração simples via API (como a do próprio WhatsApp ou um serviço de mensageria) ou o método de redirecionamento direto, que é o mais rápido para conversão.
1. Estrutura do Frontend (Next.js + Tailwind)

Aqui está o código principal da sua Landing Page com o contador regressivo e o formulário de captura.
TypeScript

// pages/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [phone, setPhone] = useState('');

  // Contador para 01 de Abril de 2026
  useEffect(() => {
    const targetDate = new Date("April 1, 2026 00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });

      if (distance < 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(`Olá! Quero me inscrever no PREVEJO. Meu contato: ${phone}`);
    const whatsappUrl = `https://wa.me/5511995009969?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-gold-500">
      <Head>
        <title>PREVEJO | Primeiro Mercado de Futuros Preditivo do Brasil</title>
      </Head>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="mb-8 animate-pulse">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 bg-clip-text text-transparent">
            PREVEJO<span className="text-white text-2xl font-light">.com.br</span>
          </h1>
          <p className="text-slate-400 mt-4 text-xl tracking-widest uppercase italic">O futuro não é um mistério. É um mercado.</p>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold max-w-4xl leading-tight">
          A primeira plataforma de <span className="text-yellow-500 underline decoration-wavy">Futuros Preditivos</span> do Brasil.
        </h2>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 my-16 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col">
              <span className="text-4xl md:text-6xl font-mono font-bold text-yellow-500">{value.toString().padStart(2, '0')}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mt-2">{unit === 'days' ? 'Dias' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Minutos' : 'Segundos'}</span>
            </div>
          ))}
        </div>

        {/* Lead Capture */}
        <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col gap-4">
          <input 
            type="tel" 
            placeholder="Seu WhatsApp (ex: 11999999999)"
            required
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-lg"
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-xl shadow-yellow-500/20">
            GARANTIR ACESSO ANTECIPADO
          </button>
        </form>

        <p className="mt-8 text-slate-500 text-sm italic">
          * Lançamento oficial: 01 de Abril de 2026. A verdade está chegando.
        </p>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}

2. Lógica de Infraestrutura (Backend e Envio)

Para garantir que os dados não fiquem apenas no redirecionamento do WhatsApp, você pode usar uma API Route no Next.js para salvar o lead em um banco de dados e disparar o alerta.
API Route (/api/subscribe.ts)

Se você quiser automatizar o envio sem o usuário precisar clicar em "enviar" no WhatsApp, precisaria de uma API como a Evolution API ou Z-API. No entanto, para este MVP de lançamento, o código acima já redireciona o usuário com a mensagem pronta.

Se preferir salvar os dados antes:

    Banco de Dados: Use o Supabase (PostgreSQL) para salvar o número do telefone.

    Automação: Use o n8n (que você já conhece bem) para ouvir o Webhook do formulário e disparar a mensagem para o seu número 11995009969.

3. Checklist de Deploy

    Domínio: Aponte o prevejo.com.br para o seu servidor na Amazon EC2 ou use a Vercel para o frontend.

    SSL: Essencial para passar credibilidade em um mercado de futuros.

    n8n Workflow: * Trigger: Webhook recebendo o telefone.

        Action: Envio de mensagem via WhatsApp (Evolution API) para o seu número avisando: "Novo lead interessado no PREVEJO: [Telefone]".

O Logotipo

O logo gerado anteriormente foca no contraste entre o "P" estilizado e gráficos de crescimento. Para a web, recomendo usar o SVG do ícone para manter a nitidez total em telas Retina (como no seu MacBook M1).

Gostaria que eu configurasse agora o workflow do n8n para salvar esses leads em uma planilha do Google Sheets e te avisar no WhatsApp simultaneamente?