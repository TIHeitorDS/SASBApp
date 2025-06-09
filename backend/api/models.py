from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    This allows for additional fields or methods in the future.
    """

    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    password = models.CharField(max_length=128, blank=False, null=False)

    class Meta:
        abstract = True
    
    def is_authenticated(self):
        """
        Override the is_authenticated method to return True.
        This is necessary for compatibility with Django's authentication system.
        """
        return True
    
    def __str__(self):
        return self.username

