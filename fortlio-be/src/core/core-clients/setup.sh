setup 
ssh-keygen -t rsa -b 4096 -C "your-email"
cat .ssh/id_rsa.pub 
git clone git@github.com:ashit1303/neo-services.git
curl -fsSL https://bun.com/install | bash