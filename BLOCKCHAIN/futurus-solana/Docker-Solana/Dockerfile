# Use native Ubuntu (ARM64)
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install core dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    git \
    wget \
    python3 \
    python3-pip \
    ca-certificates \
    bzip2 \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Set up Rust environment
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable

# Install SPL Token CLI (v5.5.0) natively
RUN cargo install spl-token-cli --version 5.5.0

# Install Solana CLI tools natively by compiling from source
# This takes ~40-60 mins but is necessary for ARM64 Linux until official binaries are provided
RUN cargo install solana-cli solana-keygen --version 1.18.15 --locked

# Install Anchor CLI natively
RUN cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Set working directory
WORKDIR /workspace

# Set common environment variables
ENV NETWORK=devnet

# Verify installation
RUN solana --version && solana-keygen --version && spl-token --version

# Default command
CMD ["/bin/bash"]
