import os
CA_FILE = '/etc/ssl/certs/ca-certificates.crt'
LOG_FILE = '/dev/null'
HELP_PATH = '../../docs'
DEFAULT_BINARY_PATHS = {
        'pg': '/usr/local/pgsql-17',
        'pg-17': '/usr/local/pgsql-17',
        'pg-16': '/usr/local/pgsql-16',
        'pg-15': '/usr/local/pgsql-15',
        'pg-14': '/usr/local/pgsql-14',
        'pg-13': '/usr/local/pgsql-13'
}
SERVER_MODE = False

# these are needed to make the container work with the environment variables
SERVER_MODE = os.getenv('PGADMIN_CONFIG_SERVER_MODE').lower() in ('true', '1', 't')
SERVER_NAME = os.getenv('PGADMIN_CONFIG_SERVER_NAME', 'pgAdmin4')
DEFAULT_SERVER = os.getenv('PGADMIN_CONFIG_DEFAULT_SERVER', 'postgresql_database')
DEFAULT_SERVER_PORT = int(os.getenv('PGADMIN_CONFIG_DEFAULT_SERVER_PORT', '5432'))
DEFAULT_USERNAME = os.getenv('PGADMIN_CONFIG_DEFAULT_USERNAME', 'admin@admin.com')
DEFAULT_PASSWORD = os.getenv('PGADMIN_CONFIG_DEFAULT_PASSWORD', 'changeme')