from django.db import migrations, models

def add_admin_user(apps, schema_editor):
    User = apps.get_model("main", "User")

    hashed_password = 'pbkdf2_sha256$30000$kl7WPV92BWu7$lvSRzmTOQEKReac39UYKOsvYPc/CHQptpvBfFKKF6hc='
    admin, created = User.objects.get_or_create(username="admin", defaults={"email": "2@2.com",
                                                                            "password": hashed_password,
                                                                            "is_superuser": True,
                                                                            "is_staff": True})


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_admin_user, lambda x, y:x)

    ]
