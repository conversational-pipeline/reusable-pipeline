FROM tiangolo/uwsgi-nginx-flask:python3.6-alpine3.8

RUN apk add --update curl gcc g++ libffi-dev openssl-dev \
    && rm -rf /var/cache/apk/*
RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

COPY requirements.txt /app/requirements.txt

RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r /app/requirements.txt

ENV TOKEN_MODEL_URL=""
ENV GROUP_MODEL_URL=""

ENV UWSGI_INI /app/uwsgi.ini

COPY ./app/etc/ng.conf /etc/nginx/conf.d/

COPY ./app /app
