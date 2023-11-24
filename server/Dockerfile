FROM python:3

ADD requirements.txt /

RUN pip install -r requirements.txt

ADD app.py /
ADD messages.txt /

CMD [ "python", "-m", "flask", "run", "--host=0.0.0.0"]
