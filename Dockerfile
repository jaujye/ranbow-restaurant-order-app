# 使用官方OpenJDK 17 Alpine映像作為基礎映像
FROM openjdk:17-jdk-alpine

# 設置維護者資訊
LABEL maintainer="ranbow-restaurant-team"
LABEL description="Ranbow Restaurant Order Application - Spring Boot Backend"

# 設置工作目錄
WORKDIR /app

# 安裝必要的系統套件
RUN apk add --no-cache curl tzdata

# 設置時區為台北時間
ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 創建非root用戶來運行應用程式（安全性考量）
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# 複製Maven包裝器和pom.xml（利用Docker快取層）
COPY mvnw pom.xml ./
COPY .mvn .mvn

# 確保Maven包裝器可執行
RUN chmod +x ./mvnw

# 下載Maven依賴（分層快取優化）
RUN ./mvnw dependency:go-offline -B

# 複製源代碼
COPY src ./src

# 編譯應用程式並創建JAR檔案
RUN ./mvnw clean package -DskipTests -B

# 將JAR檔案重命名為app.jar
RUN mv target/restaurant-order-app-*.jar app.jar

# 創建日誌目錄
RUN mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# 切換到非root用戶
USER appuser

# 暴露應用程式端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# 設置JVM參數和應用程式參數
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseContainerSupport -Djava.security.egd=file:/dev/./urandom"

# 啟動應用程式
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]