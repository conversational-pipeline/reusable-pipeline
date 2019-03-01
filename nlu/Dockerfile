FROM python:3.6

COPY requirements.txt /app/requirements.txt

RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r /app/requirements.txt

ENV MODEL_URL=""
COPY ./app /app
WORKDIR /app

CMD ["python", "main.py"]
