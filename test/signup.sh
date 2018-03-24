#!/bin/bash

curl -d "username=phil&password=test" http://localhost:8080/api/auth/signup 
curl -d "username=phil&password=test" -c cookies.txt http://localhost:8080/api/auth/login
curl -b cookies.txt http://localhost:8080/api/user
