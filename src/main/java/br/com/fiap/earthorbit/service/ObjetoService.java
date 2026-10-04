package br.com.fiap.earthorbit.service;

import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class ObjetoService {

    public static final String COLECAO = "objetos_espaciais";

    private final MongoTemplate mongoTemplate;

    public ObjetoService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<Document> listar() {
        return mongoTemplate.findAll(Document.class, COLECAO);
    }

    public Optional<Document> buscarPorId(String id) {
        return Optional.ofNullable(mongoTemplate.findById(id, Document.class, COLECAO));
    }
}
