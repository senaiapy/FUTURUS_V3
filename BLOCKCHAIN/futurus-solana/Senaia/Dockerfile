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

