# INSTALL DOCKER
mkdir Futurus

## jump in there

cd  Futurus

## Use nano to create a file

nano Dockerfile

## Copy and paste the Dockerfile code below. Use ctrl-x-enter to save.

### LINUX
# Use a lightweight base image
FROM debian:bullseye-slim

# Set non-interactive frontend for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install required dependencies and Rust
RUN apt-get update && apt-get install -y \
    curl build-essential libssl-dev pkg-config nano \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:$PATH"

# Verify Rust installation
RUN rustc --version

# Install Solana CLI
RUN curl -sSfL https://release.anza.xyz/stable/install | sh \
    && echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

# Add Solana CLI to PATH
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Verify Solana CLI installation
RUN solana --version

# Set up Solana config for Devnet
RUN solana config set -ud

# Set working directory
WORKDIR /solana-token

# Default command to run a shell
CMD ["/bin/bash"]

## ---------------------------------------------------------------------
## MAC
# Use an arm64-specific base image for M1 Mac performance
FROM --platform=linux/arm64 debian:bullseye-slim

# Set non-interactive frontend for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install required dependencies and Rust
RUN apt-get update && apt-get install -y \
    curl build-essential libssl-dev pkg-config nano git \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:$PATH"

# Install Solana CLI 
# Note: Using the specific installer for Apple Silicon/ARM compatibility
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Add Solana CLI to PATH
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Verify installations
RUN rustc --version && solana --version

# Set up Solana config for Devnet
RUN solana config set -ud

WORKDIR /solana-token

CMD ["/bin/bash"]
## ---------------------------------------------------------------------

docker build -t heysolana .

docker run -it --rm -v $(pwd):/solana-token -v $(pwd)/solana-data:/root/.config/solana heysolana

# Create an account for mint authority#

solana-keygen grind --starts-with Futurus:1

# Set the account as the default keypair

solana config set --keypair Futurus-your-token-acount.json 

# Change to devnet

solana config set --url devnet

# verify your config

solana config get

## Run this to find your solana address
solana address

## Go out to this URL https://faucet.solana.com/ to have FUT airdropped to the account you just created. What’s your account address?

# VERIFY YOUR BALANCE 

solana balance

# Create a mint address

# Sim, vamos criar outra conta. Este será o seu endereço de emissão, a fábrica que produzirá seu token. Também será o endereço oficial do seu token e a forma como você sempre saberá que está adquirindo o token correto. Vamos criá-lo começando com "mnt" para sabermos que é o nosso endereço de emissão.

solana-keygen grind --starts-with mnt:1

# mint your token

# Este exemplo utiliza o programa de token padrão da Solana com a opção `--program-id`. Estamos habilitando metadados com `--enable-metadata`, como imagens e outras informações. E quanto às casas decimais? Com ​​a opção `--decimals`, definimos quantas casas decimais nosso token pode ter. Ela especifica quantas unidades fracionárias um token pode ter. A Solana usa 9, então deve ser suficiente para nós. Certifique-se de incluir seu próprio endereço de emissão abaixo.

spl-token create-token \
--program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
--enable-metadata \
--decimals 9 \
mnt-your-mint-address.json

# Upload Metadata

# symbol and the icon.
# Let’s start with our token icon. Make sure it is:
# Square
# either 512x512 or 1024x1024
# less than 100kb

# Upload Image to some sort of online storage
# Since we are doing decentralized things, it would be nice to store our stuff on decentralized storage. I tried Pinata and I like it.

# —> https://app.pinata.cloud/
# Create an account and upload your image
# Go to IPFS Files

# cid futurus.png
 bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju

 https://yellow-visual-earwig-146.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju

 # Create Metadata file

{
  "name": "Futurus Coin",
  "symbol": "FUT",
  "description": "Futurus Coin is a cryptocurrency that is used to pay for services on the Futurus platform.",
  "image": "https://yellow-visual-earwig-146.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju",
  "attributes": [
    {
      "trait_type": "currency",
      "value": "FUT"
    }
  ]
}

# Upload Metadata
#    Agora, é hora de enviar nossos metadados. Isso realmente irá para a blockchain… o que é bem fora do comum…
#    Observe que o endereço do nosso token é fornecido sem a extensão .json.
#    Em seguida, especificamos o nome da nossa moeda.
#    E então o nosso símbolo. Eu sei, isso provavelmente é redundante… mas estamos garantindo que o trabalho seja feito.
#    E, finalmente, a URL para nossos metadados.

spl-token initialize-metadata \
mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw \
"Futurus Coin" \
"FUT" \
https://yellow-visual-earwig-146.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju

## Go out to Solana Explorer (https://explorer.solana.com/), select the devnet as your cluster # and past your token address

## Let’s make some tokens
# At this point, we’ve created or minted our token….but we haven’t created any tokens.
# Let’s do that now.
# Create a token account
# First we’ll need a token account. Why? Each Solana wallet will have individual accounts for each token it has.
# We’re creating a token account in our default wallet for our new token, Beard Coin.

spl-token create-account mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw

## Let’s print money
# With our token account created, let’s mint some tokens. We can make as many as we want and we can do this multiple times (as many as you would like….you’re the government now!)
# We’ll start with 1000.
# Note: You can only do this with the dad account we created. It’s the boss, only he can mint new tokens.

# spl-token mint mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw 1000

# Let’s check the balance of our wallet

spl-token balance mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw

## Send some tokens to a friend
# You can send to anyone with a solana wallet address.
# They will need a way to switch to the devnet to be able to see the token and balance.
# I’m going to send to one of my wallets

spl-token transfer mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw 1000 FUturus-your-token-acount.json

spl-token transfer mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw 10 G5EibadVBKxnshP3NSFagJokfxXCD2VPm6WXoqgDSdQ2 --fund-recipient --allow-unfunded-recipient

## Burn tokens
# If you want to remove tokens from circulation, you can burn them.
# This is a one-way operation and cannot be undone.

spl-token burn mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw 1000

# Going to Market REAL ACCOUNT

spl-token authorize mntbDZof8kRCoSkjW6tR9J7mvBBM4FWLQ2ysEJowAyh mint --disable

spl-token authorize mntbDZof8kRCoSkjW6tR9J7mvBBM4FWLQ2ysEJowAyh freeze --disable

## if you ever need to update metadata

spl-token update-metadata mntbDZof8kRCoSkjW6tR9J7mvBBM4FWLQ2ysEJowAyh uri https://salmon-effective-mosquito-301.mypinata.cloud/ipfs/QmZX81uxJvhtoaAwrcqSdcsbJz1pWZv4gJje17bYTz3Fo3

## burn it

spl-token burn LPTokenAddress 100

spl-token burn mnteyhFCjqLu5QwfXmEu49dGybyFN5dwPfAhoiMbjNw 100

