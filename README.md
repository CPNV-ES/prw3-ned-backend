# PRW-3 Projet Demo Deck

## Description

This project is a web application that allows users to create and share their project demo decks. It is for the PRW-3 course at CPNV. The application is built using Javascript NodeJS and Express for the backend, and React for the frontend.

## Getting Started

### Prerequisites

- NodeJS v20.19.4
- NPM 10.8.2
- MySQL instance

### Configuration

Copy the .env.example file to .env and fill in the required environment variables. (Comment are provided in the .env.example file)

## Deployment

### On dev environment

```bash
npm install 
npm run db:init
npm run dev
```

### On integration environment

TODO

## Directory structure

```shell
TODO
```

## Collaborate

### Commit Guidelines

Use conventional commit messages to describe your changes.

- https://www.conventionalcommits.org/en/v1.0.0/
- https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#file-conventional-commits-cheatsheet-md

Current commit types include:
Changes relevant to the API or UI:

- `feat`: Commits that add, adjust or remove a new feature to the API or UI
- `fix`: Commits that fix an API or UI bug of a preceded feat commit
- `refactor`: Commits that rewrite or restructure code without altering API or UI behavior
- `perf`: Commits are special type of refactor commits that specifically improve performance
- `style`: Commits that address code style (e.g., white-space, formatting, missing semi-colons) and do not affect application behavior
- `test`: Commits that add missing tests or correct existing ones
- `docs`: Commits that exclusively affect documentation
- `build`: Commits that affect build-related components such as build tools, dependencies, project version, ...
- `ops`: Commits that affect operational aspects like infrastructure (IaC), deployment scripts, CI/CD pipelines, backups, monitoring, or recovery procedures, ...
- `chore`: Commits that represent tasks like initial commit, modifying .gitignore, ...

### How to propose a new feature (issue, pull request)

1. Create an issue describing the feature you want to propose, including the problem it solves and any relevant details.
2. If you want to implement the feature yourself, create a new branch from the main branch and name it appropriately (Branching stategy above) or fork the repository if you don't have write access to the main repository.
3. Implement the feature in your branch, following the commit guidelines for any commits you make.
4. Once your implementation is complete, push your branch to the repository and create a pull request (PR) against the main branch.

### Branching Strategy

We follow a simple branching strategy is gitflow, which includes the following branches:

- `main`: The main branch that contains the production-ready code. All features and fixes are merged into this branch after they have been tested and reviewed.
- `develop`: The development branch where all features and fixes are merged before they are ready for production. This branch is used for testing and integration.
- `feature/*`: Feature branches that are created from the develop branch for each new feature or bug fix. These branches are merged back into develop once the feature or fix is complete and tested
- `release/*`: Release branches that are created from the develop branch when a new release is ready. These branches are used for final testing and bug fixing before merging into main and develop.
- `hotfix/*`: Hotfix branches that are created from the main branch to quickly fix critical issues in production. These branches are merged back into main and develop after the fix is complete.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- (Ethann Schneider)[mailto:ethann.schneider@eduvaud.ch]
- (Nathan Chauveau)[mailto:nathan.chauveau@eduvaud.ch]
- (Diogo Da Silva Fernandes)[mailto:diogo.silva2@eduvaud.ch]
