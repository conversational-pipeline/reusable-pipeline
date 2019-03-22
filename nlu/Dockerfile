FROM python:3.6

# RUN apt-get update && apt-get install -y unixodbc-dev gcc g++
WORKDIR /app

ENV FLAIR_TOKEN_MODEL_URL="https://convpipelinestorage.blob.core.windows.net/nlu-models/flair/v1/token-model.pt"
ENV FLAIR_GROUP_MODEL_URL="https://convpipelinestorage.blob.core.windows.net/nlu-models/flair/v1/group-model.pt"
RUN wget ${FLAIR_TOKEN_MODEL_URL}
RUN wget ${FLAIR_GROUP_MODEL_URL}

COPY requirements.txt /app/requirements.txt

RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r /app/requirements.txt && \
    python3 -m spacy download en

COPY ./app /app

CMD ["python", "main.py"]
