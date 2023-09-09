# Airdrop DApp

## Usage

1. Install CLIs: [Subsquid](https://docs.subsquid.io/squid-cli/installation), [Turborepo](https://turbo.build/repo/docs/installing)

    ```sh
    npm i -g @subsquid/cli@latest
    ```

    ```sh
    npm i -g turbo
    ```

2. Install dependencies

    ```sh
    npm ci
    ```

3. Build with Turbo

    ```sh
    turbo build
    ```

4. Start squid processor

    ```sh
    turbo up
    ```

5. Start application (squid query gateway and frontend)

    ```sh
    turbo dev
    ```