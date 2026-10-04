package br.com.fiap.earthorbit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

@ExtendWith(MockitoExtension.class)
class ObjetoServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ObjetoService objetoService;

    @Test
    void listarRetornaObjetosDaColecao() {
        when(mongoTemplate.findAll(Document.class, "objetos_espaciais"))
                .thenReturn(List.of(new Document("_id", "OBJ001"), new Document("_id", "OBJ002")));

        List<Document> resultado = objetoService.listar();

        assertEquals(2, resultado.size());
        assertEquals("OBJ001", resultado.get(0).getString("_id"));
    }

    @Test
    void buscarPorIdRetornaObjetoExistente() {
        when(mongoTemplate.findById("OBJ001", Document.class, "objetos_espaciais"))
                .thenReturn(new Document("_id", "OBJ001"));

        Optional<Document> resultado = objetoService.buscarPorId("OBJ001");

        assertTrue(resultado.isPresent());
    }

    @Test
    void buscarPorIdInexistenteRetornaVazio() {
        when(mongoTemplate.findById("XXX", Document.class, "objetos_espaciais")).thenReturn(null);

        assertTrue(objetoService.buscarPorId("XXX").isEmpty());
    }
}
