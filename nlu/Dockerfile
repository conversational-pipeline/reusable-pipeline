FROM python:3.6

COPY requirements.txt /app/requirements.txt

RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r /app/requirements.txt

ENV MODEL_URL="https://convpipelinestorage.blob.core.windows.net/nlu-models/model.h5"
ENV PICKLED_IDXS="https://convpipelinestorage.blob.core.windows.net/nlu-models/pickled_idxs"
COPY ./app /app
WORKDIR /app

CMD ["python", "main.py"]
