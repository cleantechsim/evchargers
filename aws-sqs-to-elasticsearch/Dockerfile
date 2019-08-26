FROM openjdk:8 as build-env
WORKDIR /compile
RUN apt-get update
RUN apt-get install -y maven
RUN apt-get install -y git
COPY ./pom.xml .
COPY aws-sqs-to-elasticsearch ./aws-sqs-to-elasticsearch
WORKDIR aws-sqs-to-elasticsearch
RUN mvn install

FROM openjdk:8

WORKDIR /app

COPY --from=build-env /compile/aws-sqs-to-elasticsearch/target/aws-sqs-to-elasticsearch-0.0.1-SNAPSHOT.jar .


# CMD ["java", "-cp", "aws-sqs-to-elasticsearch-0.0.1-SNAPSHOT.jar", "org.cleantechsim.evchargers.aws.sqs.to.elasticsearch.SQSToElasticSearchMain", "${es_host}", "${es_port}", "${interval}"]

CMD java -cp aws-sqs-to-elasticsearch-0.0.1-SNAPSHOT.jar org.cleantechsim.evchargers.aws.sqs.to.elasticsearch.SQSToElasticSearchMain $es_host $es_port $interval
