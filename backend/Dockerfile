# ===== Giai doan 1: build file .jar bang Maven + JDK 21 =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Tai thu vien truoc (tach layer de lan build sau nhanh hon khi chi sua code)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

# ===== Giai doan 2: image chay that, chi can JRE 21 =====
FROM eclipse-temurin:21-jre
WORKDIR /app

# Chay bang user thuong, khong dung root
RUN useradd --system --uid 1001 appuser
COPY --from=build /build/target/*.jar app.jar
USER appuser

EXPOSE 8080
# Gioi han heap theo RAM cua container
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
