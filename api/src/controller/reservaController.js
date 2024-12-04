const connect = require("../db/connect");

module.exports = class reservaController {
  // criação de um Reserva
  static async createReserva(req, res) {
    const { id_sala, id_usuario, data_inicio, data_fim } = req.body;

    if (!id_sala || !id_usuario || !data_inicio || !data_fim) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Verificando se data_inicio não é posterior a data_fim
    const datainicio = new Date(data_inicio);
    const datafim = new Date(data_fim);
    if (datainicio >= datafim) {
      return res
        .status(400)
        .json({
          error: "Data de início não pode ser posterior ou igual à data de fim",
        });
    }

    // Consulta para verificar se a sala já está reservada no horário desejado
    const queryV = `
      SELECT * FROM reserva 
      WHERE id_sala = ? 
      AND (
        (data_inicio < ? AND data_fim > ?) OR
        (data_inicio < ? AND data_fim > ?)
      )
    `;
    const values = [id_sala, data_fim, data_inicio, data_inicio, data_fim];

    try {
      connect.query(queryV, values, (err, results) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "Erro ao verificar disponibilidade!" });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: "Sala já reservada!" });
        }

        // Se a sala estiver disponível, realizar a reserva
        const query = `INSERT INTO reserva (data_inicio, data_fim, id_usuario, id_sala) VALUES (?,?,?,?)`;
        const novosvalores = [data_inicio, data_fim, id_usuario, id_sala];
        connect.query(query, novosvalores, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Erro ao reservar sala!" });
          }
          return res
            .status(201)
            .json({ message: "Sala reservada com sucesso" });
        });
      });
    } catch (error) {
      console.log("Erro ao executar consulta: ", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getAllReserva(req, res) {
    const query = `SELECT * FROM reserva`;
    try {
      connect.query(query, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Erro a reservar sala" });
        }
        return res
          .status(200)
          .json({ message: "Reservas listadas com sucesso", reserva: results });
      });
    } catch (error) {
      console.log("Erro ao executar a query: ", error);
      return res.status(500).json({ error: "Erro interno do Servidor" });
    }
  }

  static async updateReserva(req, res) {
    const { id_sala, data_inicio, data_fim, id_reserva } = req.body;

    if (!data_inicio || !data_fim || !id_reserva || !id_sala) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    const datainicio = new Date(data_inicio);
    const datafim = new Date(data_fim);
    if (datainicio >= datafim) {
      return res
        .status(400)
        .json({
          error: "Data de início não pode ser posterior ou igual à data de fim",
        });
    }

    const query = `SELECT * FROM reserva WHERE id_sala = ? AND (data_inicio < ? AND data_fim > ?) AND id_reserva != ?`;
    const values = [id_sala, data_fim, data_inicio, id_reserva];

    try {
      connect.query(query, values, (err, results) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ error: "Erro ao verificar disponibilidade!" });
        }
        if (results.length > 0) {
          return res.status(400).json({ error: "Horário já reservado!" });
        }

        const updateQuery = `UPDATE reserva SET data_inicio = ?, data_fim = ? WHERE id_reserva = ?`;
        const updateValues = [data_inicio, data_fim, id_reserva];

        connect.query(updateQuery, updateValues, (err) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "Erro ao atualizar a reserva!" });
          }

          return res
            .status(201)
            .json({ message: "Reserva atualizada com sucesso!" });
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async deleteReserva(req, res) {
    const reservaId = req.params.id;
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    const values = [reservaId];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Reserva não Encontrada" });
        }
        return res
          .status(200)
          .json({ message: "Reserva Excluída com Sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};
