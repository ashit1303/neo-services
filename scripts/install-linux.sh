#!/bin/bash

# =========================
# COLORS & UI
# =========================

print_message() {
    case "$2" in
        success) COLOR="\e[1;32m" ;; # Green
        fail)    COLOR="\e[1;31m" ;; # Red
        skip)    COLOR="\e[1;34m" ;; # Blue
        info)    COLOR="\e[1;33m" ;; # Yellow
        *)       COLOR="\e[0m" ;;
    esac

    echo -e "\n${COLOR}$1\e[0m\n"
}

header() {
    echo -e "\e[1;35m"
    cat <<EOF

=========== SERVER SETUP ===========

1) Git
2) OpenSSH
3) Nginx
4) Bunjs
5) MariaDB
6) Redis
7) Vector
8) ZincSearch
9) NoIP DUC
10) Network Tools
11) Nodejs
12) Typesense
13) Podman
14) MongoDB

====================================

EOF
    echo -e "\e[0m"
}

# =========================
# INSTALL HELPERS
# =========================

install_mongodb() {
    if command -v mongod &>/dev/null; then
        print_message "MongoDB already installed... Skipping" skip
        return
    fi

    print_message "Installing MongoDB..." info

    curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    --dearmor

    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

    sudo apt update

    sudo apt install -y mongodb-org

    sudo systemctl enable mongod
    sudo systemctl start mongod

    print_message "MongoDB installed successfully!" success
}

install_typesense() {
    if command -v typesense-server &>/dev/null; then
        print_message "Typesense already installed... Skipping" skip
        return
    fi

    print_message "Installing Typesense..." info

    curl -O https://dl.typesense.org/releases/30.2/typesense-server-30.2-amd64.deb

    sudo dpkg -i typesense-server-29.0-amd64.deb

    rm -f typesense-server-29.0-amd64.deb

    sudo systemctl enable typesense-server
    sudo systemctl start typesense-server

    print_message "Typesense installed successfully!" success
}

install_bun() {
    if command -v bun &>/dev/null; then
        print_message "Bun already installed... Skipping" skip
        return
    fi

    print_message "Installing Bun..." info

    curl -fsSL https://bun.sh/install | bash

    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"

    if command -v bun &>/dev/null; then
        print_message "Bun installed successfully!" success
    else
        print_message "Failed to install Bun" fail
    fi
}   

install_package() {
    PACKAGE=$1
    COMMAND=$2

    if command -v "$COMMAND" &>/dev/null; then
        print_message "$PACKAGE already installed... Skipping" skip
        return
    fi

    print_message "Installing $PACKAGE ..." info

    if sudo apt install -y "$PACKAGE"; then
        print_message "$PACKAGE installed successfully!" success
    else
        print_message "Failed to install $PACKAGE" fail
    fi
}

install_vector() {
    if command -v vector &>/dev/null; then
        print_message "Vector already installed... Skipping" skip
        return
    fi

    VECTOR_URL="https://packages.timber.io/vector/0.44.0/vector_0.44.0-1_amd64.deb"

    print_message "Installing Vector..." info

    wget -q "$VECTOR_URL" -O vector.deb
    sudo dpkg -i vector.deb
    rm -f vector.deb

    print_message "Vector installed successfully!" success
}

install_zinc() {
    if command -v zincsearch &>/dev/null; then
        print_message "ZincSearch already installed... Skipping" skip
        return
    fi

    ZINC_URL="https://github.com/zincsearch/zincsearch/releases/download/v0.4.10/zincsearch_0.4.10_Linux_x86_64.tar.gz"

    print_message "Installing ZincSearch..." info

    wget -q "$ZINC_URL" -O zinc.tar.gz

    tar -xzf zinc.tar.gz

    sudo chmod +x zincsearch
    sudo mv zincsearch /usr/local/bin/

    rm -f zinc.tar.gz

    print_message "ZincSearch installed successfully!" success
}

install_noip() {
    NOIP_URL="https://www.noip.com/download/linux/latest"

    print_message "Installing NoIP DUC..." info

    mkdir -p noip-duc

    wget -q "$NOIP_URL" -O noip.tar.gz

    tar -xzf noip.tar.gz -C noip-duc

    DEB_FILE=$(find noip-duc -name "*.deb" | head -n 1)

    if [ -n "$DEB_FILE" ]; then
        sudo dpkg -i "$DEB_FILE"
        print_message "NoIP DUC installed successfully!" success
    else
        print_message "No .deb package found!" fail
    fi

    rm -f noip.tar.gz
}

# =========================
# START
# =========================

header

print_message "Updating packages..." info
sudo apt update && sudo apt upgrade -y

echo
read -p "Enter numbers to install (example: 1 3 5): " choices
echo

for choice in $choices; do
    case $choice in

        1)
            install_package git git
            ;;

        2)
            install_package openssh-server ssh
            ;;

        3)
            install_package nginx nginx
            ;;

        4)
            install_bun
            ;;

        5)
            install_package mariadb-server mariadb
            ;;

        6)
            install_package redis-server redis-cli
            ;;

        7)
            install_vector
            ;;

        8)
            install_zinc
            ;;

        9)
            install_noip
            ;;

        10)
            install_package net-tools ifconfig
            install_package nmap nmap
            install_package arp-scan arp-scan
            ;;
        11)
            install_package nodejs node
            ;;
        12) 
            install_typesense
            ;;
        13)
            install_package podman podman
            ;;
        14)
            install_mongodb
            ;;
        *)
            print_message "Invalid option: $choice" fail
            ;;
    esac
done

print_message "Selected installations completed!" success