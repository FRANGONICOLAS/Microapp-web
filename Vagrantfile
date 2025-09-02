# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.define :servidorWeb do |servidorWeb|
    servidorWeb.vm.box = "bento/ubuntu-22.04"
    servidorWeb.vm.network :private_network, ip: "192.168.60.3"
    servidorWeb.vm.provision "file", source: "app", destination: "/home/vagrant/app"
    servidorWeb.vm.provision "file", source: "DB_final.sql", destination: "/home/vagrant/init.sql"
    #    config.vm.synced_folder "./Github", "/home/vagrant/Compartida"
    servidorWeb.vm.provision "shell", path: "script.sh"
    servidorWeb.vm.hostname = "servidorWeb"
  end
end
