from django.db import models

# Create your models here.
from django.contrib.auth.models import User

from services.models import BaseModel



# Create your models here.


class Account(BaseModel):
    user = models.ForeignKey(User)
  
