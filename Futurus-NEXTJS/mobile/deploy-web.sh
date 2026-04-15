#!/bin/bash

# Futurus - Web Deployment Script
# This script helps you deploy the web version to different platforms

set -e  # Exit on error

echo "🚀 Futurus - Web Deployment"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "${YELLOW}⚠️  Build not found. Building web version...${NC}"
  pnpm web:export
else
  echo "${GREEN}✅ Build found in /dist${NC}"
fi

echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Firebase Hosting"
echo "4) GitHub Pages"
echo "5) Just rebuild (don't deploy)"
echo ""

read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo ""
    echo "${YELLOW}Deploying to Vercel...${NC}"

    # Check if logged in
    if ! vercel whoami &> /dev/null; then
      echo "${YELLOW}Not logged in. Running 'vercel login'...${NC}"
      vercel login
    fi

    echo "${GREEN}Deploying to production...${NC}"
    vercel --prod

    echo ""
    echo "${GREEN}✅ Deployed to Vercel!${NC}"
    ;;

  2)
    echo ""
    echo "${YELLOW}Deploying to Netlify...${NC}"

    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
      echo "${YELLOW}Netlify CLI not found. Installing...${NC}"
      npm i -g netlify-cli
    fi

    # Check if logged in
    if ! netlify status &> /dev/null; then
      echo "${YELLOW}Not logged in. Running 'netlify login'...${NC}"
      netlify login
    fi

    echo "${GREEN}Deploying to production...${NC}"
    netlify deploy --prod

    echo ""
    echo "${GREEN}✅ Deployed to Netlify!${NC}"
    ;;

  3)
    echo ""
    echo "${YELLOW}Deploying to Firebase...${NC}"

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
      echo "${YELLOW}Firebase CLI not found. Installing...${NC}"
      npm i -g firebase-tools
    fi

    # Check if logged in
    if ! firebase projects:list &> /dev/null; then
      echo "${YELLOW}Not logged in. Running 'firebase login'...${NC}"
      firebase login
    fi

    # Initialize if needed
    if [ ! -f "firebase.json" ]; then
      echo "${YELLOW}Initializing Firebase hosting...${NC}"
      firebase init hosting
    fi

    echo "${GREEN}Deploying to Firebase...${NC}"
    firebase deploy --only hosting

    echo ""
    echo "${GREEN}✅ Deployed to Firebase!${NC}"
    ;;

  4)
    echo ""
    echo "${YELLOW}Deploying to GitHub Pages...${NC}"

    # Check if gh-pages is installed
    if ! pnpm list gh-pages &> /dev/null; then
      echo "${YELLOW}Installing gh-pages...${NC}"
      pnpm add -D gh-pages
    fi

    # Deploy
    echo "${GREEN}Publishing to gh-pages branch...${NC}"
    npx gh-pages -d dist

    echo ""
    echo "${GREEN}✅ Deployed to GitHub Pages!${NC}"
    echo "Enable GitHub Pages in your repository settings:"
    echo "Settings → Pages → Source: gh-pages branch"
    ;;

  5)
    echo ""
    echo "${YELLOW}Rebuilding web version...${NC}"
    pnpm web:export
    echo "${GREEN}✅ Build complete in /dist${NC}"
    ;;

  *)
    echo "${YELLOW}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo "🎉 Done!"
