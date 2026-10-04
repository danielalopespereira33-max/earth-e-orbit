package br.com.fiap.earthorbit.controller;

import java.util.List;

import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fiap.earthorbit.dto.MonitoramentoRequest;
import br.com.fiap.earthorbit.service.ConsultaService;
import br.com.fiap.earthorbit.service.MonitoramentoService;
import br.com.fiap.earthorbit.service.ObjetoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final ObjetoService objetoService;
    private final ConsultaService consultaService;
    private final MonitoramentoService monitoramentoService;

    public ApiController(ObjetoService objetoService, ConsultaService consultaService,
            MonitoramentoService monitoramentoService) {
        this.objetoService = objetoService;
        this.consultaService = consultaService;
        this.monitoramentoService = monitoramentoService;
    }

    @GetMapping("/usuarios")
    public List<Document> usuarios() {
        return consultaService.usuarios();
    }

    @GetMapping("/objetos")
    public List<Document> objetos() {
        return objetoService.listar();
    }

    @GetMapping("/objetos/{id}")
    public ResponseEntity<Document> objeto(@PathVariable String id) {
        return objetoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/monitoramentos")
    public List<Document> monitoramentos() {
        return consultaService.monitoramentos();
    }

    @PostMapping("/monitoramentos")
    public ResponseEntity<Document> criarMonitoramento(@Valid @RequestBody MonitoramentoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(monitoramentoService.criar(req));
    }

    @GetMapping("/analises-risco")
    public List<Document> analisesRisco() {
        return consultaService.analisesRisco();
    }
}
