FROM php:8.4-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        pkg-config \
        libssl-dev \
        libzip-dev \
        libicu-dev \
        libonig-dev \
    && docker-php-ext-install bcmath intl mbstring pcntl zip \
    && rm -rf /var/lib/apt/lists/*

# PECL's own downloader was saving a truncated mongodb-2.5.7.tgz and then failing to unpack it.
RUN curl -fL --retry 5 --retry-all-errors -o /tmp/mongodb.tgz https://pecl.php.net/get/mongodb-2.5.7.tgz \
    && test "$(stat -c%s /tmp/mongodb.tgz)" -eq 2284321 \
    && pecl install /tmp/mongodb.tgz \
    && docker-php-ext-enable mongodb \
    && rm -f /tmp/mongodb.tgz

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN printf '%s\n' \
        'opcache.enable=1' \
        'opcache.enable_cli=1' \
        'opcache.memory_consumption=128' \
        'opcache.max_accelerated_files=20000' \
        'opcache.validate_timestamps=1' \
        'opcache.revalidate_freq=0' \
        > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

EXPOSE 8000 5173
