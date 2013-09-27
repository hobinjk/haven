FROM ubuntu
MAINTAINER James Hobin <hobinjk@mit.edu>

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y curl
RUN apt-get install -y git

# Install go, set up environment variables accordingly
RUN curl http://go.googlecode.com/files/go1.0.3.linux-amd64.tar.gz | tar -xz -C /usr/local
ENV GOROOT /usr/local/go
ENV PATH $PATH:/usr/local/go/bin

# Clone haven and its dependencies
RUN mkdir -p /haven/src/github.com/hobinjk
RUN git clone https://github.com/hobinjk/haven /haven/src/github.com/hobinjk/haven
ENV GOPATH /haven
RUN go get github.com/golang/groupcache/lru
RUN cd $GOPATH/src/github.com/hobinjk/haven && go build

# Expose the server port
EXPOSE 9001

# Set the working directory to the location of the executable
WORKDIR /haven/src/github.com/hobinjk/haven

# start the container with sudo docker run -d -p 9001:9001 hobinjk/haven
CMD ["./haven"]

