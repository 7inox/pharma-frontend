package pe.edu.upeu.Practica.dto;
import java.util.List;
public record PaginaResponseDTO<T>(List<T> contenido, int pagina, int tamanio, long totalElementos, int totalPaginas, boolean ultima) {}