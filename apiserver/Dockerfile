FROM semarjt/appserver

COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

COPY . /app/code
RUN rm -rf /app/code/*.pyc


CMD ["python" , "/app/code/manage.py" , "runserver", "0.0.0.0:8080"]


EXPOSE 8080
