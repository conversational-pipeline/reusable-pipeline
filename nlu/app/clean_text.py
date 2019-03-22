from num2words import num2words
import spacy
import string

spacy_nlp = spacy.load('en')

def _lemmatize(words):
    doc = spacy_nlp(' '.join(words))
    for token in doc:
        if token.lemma_ != '-PRON-':
            yield token.lemma_
        else:
            yield token.text

def _num_to_word(words):
    for word in words:
        if word.isdigit():
            if '.' in word:
                yield num2words(word, to='currency')
            else:
                yield num2words(word)
        else:
            yield word

def _remove_punctuation(words):
    table = str.maketrans('', '', string.punctuation)
    for word in words:
        yield word.translate(table)

def _lowercase(words):
    for word in words:
        yield word.lower()

def _filter_stopwords(words):
    with open('stopwords.txt') as f:
        stopwords = f.read().splitlines()
        for word in words:
            if word not in stopwords:
                yield word

def _filter_not_alphanumeric(words):
    for word in words:
        yield ''.join(ch for ch in word if ch.isalnum())

def clean_text(utterance):
    words = utterance.split()
    words = _num_to_word(words)
    words = _remove_punctuation(words)
    words = _lowercase(words)
    words = _lemmatize(words)
    words = _filter_stopwords(words)
    words = _filter_not_alphanumeric(words)
    return ' '.join(words)