package br.com.fiap.earthorbit.service;

import java.time.Instant;
import java.util.UUID;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.fiap.earthorbit.dto.MonitoramentoRequest;

@Service
public class MonitoramentoService {

    private final MongoTemplate mongoTemplate;

    public MonitoramentoService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Document criar(MonitoramentoRequest req) {
        if (!req.fim().isAfter(req.inicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fim deve ser posterior ao inicio");
        }
        boolean usuarioExiste = mongoTemplate.exists(
                Query.query(Criteria.where("_id").is(req.usuarioId())), "usuarios");
        if (!usuarioExiste) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "usuarioId inexistente");
        }
        Document doc = new Document("_id", "MON-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .append("simulado", true)
                .append("criadoEm", Instant.now())
                .append("usuarioId", req.usuarioId())
                .append("nome", req.nome())
                .append("tipo", req.tipo())
                .append("ativo", true)
                .append("janela", new Document("inicio", req.inicio()).append("fim", req.fim()));
        return mongoTemplate.insert(doc, "monitoramentos");
    }
}
