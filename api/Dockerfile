FROM python:3.10-slim
LABEL maintainer="Mike Bamford <mike@msb.me.uk>"

WORKDIR /app

# Pre-install requirements to make re-build times smaller when developing.
# Uninstall build packages required to install the Python packages in order
# to minimise the image size.
ADD ./requirements/ /app/requirements/
RUN pip --no-cache-dir install -r ./requirements/docker.txt \
  && pip --no-cache-dir install -r ./requirements/requirements.txt

# Copy the tool itself, and copy other files to support running tox. We don't
# delete any of the added files in order that tox can continue to be run.
ADD ./entrypoint.sh /app/
ADD ./src/ /app/src/

# Set up webapp entrypoint
ENV PORT=8000
ENTRYPOINT ["./entrypoint.sh"]
