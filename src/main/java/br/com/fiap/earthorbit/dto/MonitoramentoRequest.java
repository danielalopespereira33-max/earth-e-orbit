package br.com.fiap.earthorbit.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record MonitoramentoRequest(
        @NotBlank(message = "usuarioId e obrigatorio") String usuarioId,
        @NotBlank(message = "nome e obrigatorio") String nome,
        @NotBlank(message = "tipo e obrigatorio")
        @Pattern(regexp = "regiao|rota_aerea|rota_maritima",
                message = "tipo deve ser regiao, rota_aerea ou rota_maritima") String tipo,
        @NotNull(message = "inicio e obrigatorio") Instant inicio,
        @NotNull(message = "fim e obrigatorio") Instant fim) {
}
