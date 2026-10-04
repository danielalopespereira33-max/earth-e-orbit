package br.com.fiap.earthorbit.service;

import java.util.List;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

/** Consultas de leitura nas demais colecoes do modelo documental. */
@Service
public class ConsultaService {

    private final MongoTemplate mongoTemplate;

    public ConsultaService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<Document> usuarios() {
        return mongoTemplate.findAll(Document.class, "usuarios");
    }

    public List<Document> monitoramentos() {
        return mongoTemplate.findAll(Document.class, "monitoramentos");
    }

    public List<Document> analisesRisco() {
        return mongoTemplate.findAll(Document.class, "analises_risco");
    }
}
