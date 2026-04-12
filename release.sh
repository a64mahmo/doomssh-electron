#!/bin/bash

# --- DoomSSH Automation Script ---
# This script handles:
# 1. Staging all changes
# 2. Incrementing version (patch, minor, or major)
# 3. Committing and Tagging
# 4. Pushing branch and tags to GitHub
# ---------------------------------

# Set colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure we're on a clean git state or at least have nothing staged that we didn't mean to
echo -e "${BLUE}Checking repository status...${NC}"
git status

# Ask for version type
echo -e "\n${BLUE}What type of release is this?${NC}"
select VERSION_TYPE in "patch" "minor" "major" "cancel"; do
    case $VERSION_TYPE in
        patch|minor|major ) break;;
        cancel ) exit 0;;
    esac
done

# Ask for commit message
echo -e "\n${BLUE}Enter a commit message:${NC}"
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}Error: Commit message cannot be empty.${NC}"
    exit 1
fi

# Step 1: Add everything
echo -e "\n${BLUE}Step 1: Staging all changes...${NC}"
git add .

# Step 2: Bump version and create tag
# npm version automatically creates a commit and a tag based on the version
# We use --force to allow it to include the changes we just staged in the version commit
echo -e "\n${BLUE}Step 2: Bumping version ($VERSION_TYPE)...${NC}"
NEW_VERSION=$(npm version $VERSION_TYPE --force -m "$COMMIT_MSG [release v%s]")

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: npm version failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Version bumped to $NEW_VERSION${NC}"

# Step 3: Push to GitHub
echo -e "\n${BLUE}Step 3: Pushing to GitHub (origin)...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Push current branch
git push origin "$CURRENT_BRANCH"

# Push the new tag (this triggers the release workflow)
git push origin "$NEW_VERSION"

echo -e "\n${GREEN}Successfully pushed $NEW_VERSION to GitHub!${NC}"
echo -e "${BLUE}GitHub Actions will now begin the build and release process.${NC}"
echo -e "Monitor progress here: https://github.com/a64mahmo/doomssh-electron/actions"
