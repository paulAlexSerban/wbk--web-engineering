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

# Docker exposes a browser UI, so this must be server mode.
# Desktop mode looks for pgadmin4@pgadmin.org and returns 401.
SERVER_MODE = True
DEFAULT_SERVER = '0.0.0.0'
DEFAULT_SERVER_PORT = 80
