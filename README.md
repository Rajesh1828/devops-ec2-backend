Project 1 — Deploy a Node.js Backend on AWS EC2
Beginner
Week 1
7 hours

Manual deployment: GitHub → EC2 → PM2 → Nginx
Build a working backend first. In Project 2, you'll containerize the same application using Docker Compose.

Step 1. Understand the architecture
Your laptop

Develop code and push to GitHub

GitHub repository

Version-controlled Node.js API

AWS EC2 — Ubuntu
Nginx

Public HTTP traffic · Port 80

PM2

Keeps the Node.js process running

Node.js + Express

API listens on 127.0.0.1:4000



Request flow: Browser → EC2 public IP on port 80 → Nginx → Node.js on port 4000 → JSON response.

We'll expose only ports 22 (SSH, restricted to your IP) and 80 (HTTP). The backend's port 4000 will not be public. AWS security groups control inbound and outbound traffic. 

Amazon Elastic Compute Cloud
+1



Step 2. Your seven-day schedule
Day	Task	Expected result
1	Create the Node.js API locally	Health endpoint works
2	Push code to GitHub	Repository ready
3	Launch an EC2 instance	Ubuntu server running
4	SSH into EC2 and install Node.js, Git and Nginx	Server ready
5	Clone and run the backend using PM2	API runs on EC2
6	Configure Nginx	API accessible over HTTP
7	Validate, document and practise interview questions	Project completed


Day 1 — Create the backend locally
1.1 Check your development environment
On your Windows computer, open PowerShell or the VS Code terminal.
node --version
npm --version
git --version


If these commands show version numbers, continue. Otherwise, install Node.js LTS and Git before proceeding.
1.2 Create the project
mkdir devops-ec2-backend
cd devops-ec2-backend

npm init -y
npm install express
npm pkg set scripts.start="node server.js"


Create these files in VS Code:
devops-ec2-backend/
├── server.js
├── package.json
├── package-lock.json
└── .gitignore


1.3 Write the backend API
Create server.js:

const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "DevOps Project 1 - Node.js API",
    status: "running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "devops-ec2-backend"
  });
});

app.get("/api/info", (req, res) => {
  res.json({
    project: "AWS EC2 Backend Deployment",
    environment: process.env.NODE_ENV || "development"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});



What this code does:
- express() creates your backend application.
- PORT lets you configure the port using an environment variable.
- /api/health gives you a simple endpoint for checking whether the API responds.
- app.listen() starts the HTTP server.
The app binds to 0.0.0.0 so it can run inside different network environments. Later, Nginx will proxy requests to it, while the EC2 security group prevents direct public access to port 4000.
1.4 Add .gitignore
node_modules/
.env
npm-debug.log*


Never commit passwords, API keys or other secrets to GitHub.
1.5 Test locally
Run:
npm start


Open these URLs in your browser:
- http://localhost:4000/
- http://localhost:4000/api/health
- http://localhost:4000/api/info
Expected health response:
{
  "status": "healthy",
  "service": "devops-ec2-backend"
}


Stop the server with Ctrl+C when finished.

Day 1 completion criteria: all three endpoints return JSON locally.

Day 2 — Push your project to GitHub
2.1 Create a GitHub repository
Open GitHub — Create a new repository.
- Repository name: devops-ec2-backend
- Visibility: Public (recommended for your portfolio)
- Don't initialize it with a README, since your local project already exists.
2.2 Push your code
Run these commands in the project folder:
git init
git add .
git commit -m "Create Node.js backend API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devops-ec2-backend.git
git push -u origin main


Replace YOUR_USERNAME with your GitHub username.

Check the repository online. You should see server.js, package.json, package-lock.json, and .gitignore.

Interview question: Why do we use Git?

Answer: Git tracks source-code changes, allows developers to collaborate, and helps restore previous versions when necessary.

Day 3 — Launch your AWS EC2 server
3.1 Open the AWS console
Go to Amazon EC2 Console.
1. Select a nearby AWS Region that suits your needs, for example Mumbai (ap-south-1).
2. Choose Launch instance.
3. Configure the instance as follows.
Setting	Choose
Name	devops-project-1
AMI	Ubuntu Server 24.04 LTS
Instance type	Smallest eligible instance suitable for this lab
Key pair	Create devops-project-1-key
Storage	Default small root volume, such as 8 GiB
Public IP	Enable public IPv4 assignment

Instance availability and free usage depend on your account and Region. Check the pricing and eligibility before launching. 

Amazon Elastic Compute Cloud
+1



3.2 Configure the security group
Add these inbound rules:
Type	Port	Source
SSH	22	My IP
HTTP	80	Anywhere IPv4 (0.0.0.0/0)

Do not add an inbound rule for port 4000. HTTPS port 443 can be added later when you configure TLS.

AWS recommends restricting SSH to trusted source addresses instead of opening it to the entire internet. 

Amazon Elastic Compute Cloud
+1



3.3 Download and protect your key
Download the .pem key file and keep it somewhere safe. Do not commit it to GitHub.

For example, if you saved it in your Windows Downloads folder:
$KEY = "$HOME\Downloads\devops-project-1-key.pem"


On the EC2 instance details page, copy its Public IPv4 address. We'll call it YOUR_EC2_PUBLIC_IP below.
3.4 Connect to EC2
In PowerShell:
ssh -i "$KEY" ubuntu@YOUR_EC2_PUBLIC_IP


Replace the placeholder with the actual IP address.

Type yes if SSH asks you to confirm the server's host key on your first connection.

Verify the connection:
whoami
hostname
ls


Expected username:
ubuntu


Day 3 completion criteria: you can connect to your Ubuntu server using SSH.

Day 4 — Prepare the server
Run the following commands inside your EC2 SSH session, not on your Windows computer.
4.1 Update Ubuntu
sudo apt update
sudo apt upgrade -y


4.2 Install Git, Nginx and essential tools
sudo apt install -y git curl nginx


Check the installations:
git --version
nginx -v
curl --version


Start Nginx and configure it to start automatically after reboots:
sudo systemctl enable --now nginx
sudo systemctl status nginx --no-pager


In your local browser, open:

http://YOUR_EC2_PUBLIC_IP

You should see the default Nginx welcome page.
4.3 Install Node.js 22 LTS
Use the NodeSource setup script to configure its Node.js 22 package repository:
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs


Verify:
node --version
npm --version


The Node.js version should report v22.x.x.

For production systems, review external installation scripts and use approved package sources and version-management practices.

Day 4 completion criteria: Git, Nginx, Node.js and npm are installed.

Day 5 — Deploy the backend using PM2
5.1 Clone your GitHub repository
Inside EC2:
cd ~
git clone https://github.com/YOUR_USERNAME/devops-ec2-backend.git
cd devops-ec2-backend


Replace the GitHub username. If you chose a private repository, configure authenticated access rather than embedding credentials in the clone URL.
5.2 Install dependencies
npm ci


This installs the dependencies from package-lock.json.
5.3 Install PM2
sudo npm install -g pm2


PM2 is a process manager that can restart your Node.js application if it crashes.
5.4 Start the API
PORT=4000 NODE_ENV=production pm2 start server.js --name devops-api


Check the process:
pm2 status
pm2 logs devops-api --lines 20


Test the backend directly from the server:
curl http://127.0.0.1:4000/api/health


Expected output:
{"status":"healthy","service":"devops-ec2-backend"}


5.5 Enable startup after reboot
Run:
pm2 startup


PM2 will print a command that begins with sudo. Copy and execute the exact command it prints, then save the process list:
pm2 save


Verify the process remains healthy:
pm2 status


Day 5 completion criteria: the API runs under PM2 and responds to requests from within EC2.

Day 6 — Configure Nginx as a reverse proxy
Nginx will receive public HTTP requests and forward them to the backend on port 4000.
6.1 Create the Nginx configuration
On EC2, run:
sudo nano /etc/nginx/sites-available/devops-api


Paste the following configuration:

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}



Save in Nano with Ctrl+O, Enter, then exit with Ctrl+X.
6.2 Enable your configuration
sudo ln -s /etc/nginx/sites-available/devops-api /etc/nginx/sites-enabled/devops-api


Disable the default site:
sudo rm /etc/nginx/sites-enabled/default


Validate the Nginx configuration before reloading:
sudo nginx -t


If it reports that the configuration is successful, reload Nginx:
sudo systemctl reload nginx


6.3 Test the public API
On your Windows computer, open:
- http://YOUR_EC2_PUBLIC_IP/
- http://YOUR_EC2_PUBLIC_IP/api/health
- http://YOUR_EC2_PUBLIC_IP/api/info
All three endpoints should return the expected JSON responses.

Notice that the browser connects to port 80. Nginx forwards the request internally to port 4000.
This is an HTTP-only learning deployment. Don't send sensitive information through it. For real production use, configure HTTPS with a domain and TLS certificate.


Day 7 — Validation and troubleshooting
Run these checks on EC2.
Check	Command
Node process	pm2 status
Application logs	pm2 logs devops-api
Backend local response	curl -i http://127.0.0.1:4000/api/health
Nginx syntax	sudo nginx -t
Nginx status	sudo systemctl status nginx --no-pager
Nginx logs	sudo tail -n 50 /var/log/nginx/error.log
Listening ports	sudo ss -lntp

Common issues:
- SSH timeout: Check the instance's public IP, instance state, network configuration and SSH security-group source.
- 502 Bad Gateway: Check PM2 status, application logs, and whether port 4000 is listening.
- Connection refused on port 80: Check Nginx status and the HTTP security-group rule.
- API works locally but not in the browser: Check the Nginx configuration and the EC2 security group.
