# specky.one

## .env structure

```py
## HTTPS
CERT_KEY = "path to `privkey.pem` file"
CERT_CERT = "path to `fullchain.pem` file"

## UTILS

# prints some more stuff that may be useful
DEBUG = true

# gives anyone access to a really useful yet dangerous page
# this page allows to obtain full admin access and other features
# use this setting only if you're developing while nobody else can access the webpage 
DEV_MODE = false

## DISCORD LOGIN RELATED

# discord client ID
CLIENT_ID = "1056218400197705839"

# discord client secret
CLIENT_SECRET = ""

# discord oauth scopes link
REDIRECT_URI = ""

# discord oauth ridirect callback link
REDIRECT_URI_CALLBACK = "https://specky.one/auth"

# admin's discord ids (split by spaces)
ADMINS = "334361254435225602"
```
