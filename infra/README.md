# Never Knows Sauce Infrastructure Configuration

The Ansible playbook is written with Ubuntu 24 in mind, although
it should be relatively universal. You can create an `inventory.yml`
file to specify the `prod` host configuration.

Before using the playbook, don't forget to change the domain used in Caddyfile.
The Caddyfile also sets up two subdomains for development — you should
remove their configuration if you don't plan to use them.
