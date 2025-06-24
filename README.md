# SASBApp - Sistema de Agendamento para Salões de Beleza

O **SASBApp** é uma aplicação desenvolvida para facilitar o gerenciamento de agendamentos em salões de beleza, oferecendo recursos específicos para administradores e colaboradores.

## Funcionalidades

### Administrador (Proprietário)
- Área administrativa personalizada
- Cadastro e gerenciamento de serviços oferecidos
- Adição e gerenciamento de colaboradores
- Visualização de todos os agendamentos realizados

### Colaboradores (Funcionários)
- Realização de agendamentos para clientes
- Cancelamento e consulta de atendimentos
- Inserção dos dados do cliente (nome, contato, serviço solicitado)
- Visualização do histórico de atendimentos

## Diferenciais
- Foco na gestão interna do salão
- Interface intuitiva para administradores e colaboradores
- Organização eficiente da rotina de trabalho

## Observações
- O sistema não possui interface para clientes finais; todo o processo é realizado pelos colaboradores.
- Ideal para salões que buscam otimizar o controle de agendamentos e atendimentos.

## Como rodar o projeto

Primeiro, clone o repositório SASBApp no seu computador e acesso-o:

```bash
git glone https://github.com/TIHeitorDS/SASBApp.git

cd SASBApp
```

### Backend
Para rodar o backen localmente, certifique-se que você tenha o ```python >= 3.10``` instalado no seu computador. Feito isso, siga os seguintes comandos:


- windows
```bash
cd backend

python -m venv .venv

.\.venv\Scripts\activate
```

- linux ou macos

```bash
cd backend

python3 -m venv .venv

. venv/bin/activate
```

Baixando as dependências:
```python3
pip install -r requirements.txt
```

Realizando as migrações e criando o super usuário

- windows
```python
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

- linux ou macos
```python
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser
```

Rodando o servidor:

- windows
```python
python manage.py runserver
```

- linux ou macos
```python
python3 manage.py runserver
```

### Frontend
Para rodar o frontend localmente, verifique se você tem o ```node >=20.x``` instalado no seu computador. Feito isso, siga as seguintes etapas:

```bash
cd frontend
npm install
npm run dev
```

---

Desenvolvido para proporcionar praticidade, controle e eficiência na gestão de salões de beleza.
