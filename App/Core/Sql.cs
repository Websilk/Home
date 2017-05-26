using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Websilk
{
    public enum enumSqlDataTypes
    {
        SqlClient = 0, MySql = 1
    }

    public class Sql
    {
        private Server Server;
        private Utility.Util Util;
        private SqlConnection conn = new SqlConnection();
        private SqlCommand cmd = new SqlCommand();
        private bool _started = false;

        public SqlDataReader reader;
        public enumSqlDataTypes dataType;

        #region "SqlServer Engine"
        public Sql(Server server, Utility.Util util)
        {
            Server = server;
            Util = util;
        }

        private void Start()
        {
            if (_started == true) { return; }

            string active = Server.sqlActive;

            switch (active)
            {
                case "SqlServer":
                case "SqlServerTrusted":
                    dataType = enumSqlDataTypes.SqlClient;
                    break;

                case "MySql":
                    dataType = enumSqlDataTypes.MySql;
                    break;
            }

            conn.ConnectionString = Server.sqlConnection;
            conn.Open();
            cmd.Connection = conn;
            cmd.CommandType = System.Data.CommandType.Text;
            _started = true;
        }

        public void Close()
        {
            if (_started == true) { conn.Close(); }
        }

        public SqlDataReader ExecuteReader(string sql, List<SqlParameter> parameters = null)
        {
            if (_started == false) { Start(); }
            if(conn.State == System.Data.ConnectionState.Closed) { conn.Open(); }
            cmd.Parameters.Clear();
            cmd.CommandText = sql;
            try
            {
                if (parameters != null) { parameters.ForEach(a => cmd.Parameters.Add(a)); }
                return cmd.ExecuteReader();
                conn.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void ExecuteNonQuery(string sql, List<SqlParameter> parameters = null)
        {
            if (_started == false) { Start(); }
            if (conn.State == System.Data.ConnectionState.Closed) { conn.Open(); }
            cmd.Parameters.Clear();
            cmd.CommandText = sql;
            try
            {
                if (parameters != null) { parameters.ForEach(a => cmd.Parameters.Add(a)); }
                cmd.ExecuteNonQuery();
                conn.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public object ExecuteScalar(string sql, List<SqlParameter> parameters = null)
        {
            if (_started == false) { Start(); }
            if (conn.State == System.Data.ConnectionState.Closed) { conn.Open(); }
            cmd.Parameters.Clear();
            cmd.CommandText = sql;
            try
            {
                if (parameters != null) { parameters.ForEach(a => cmd.Parameters.Add(a)); }
                var obj = cmd.ExecuteScalar();
                conn.Close();
                return obj;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<int> ExecuteNonQueryAsync(string sql, params SqlParameter[] parameters)
        {
            using (var newConnection = new SqlConnection(Server.sqlConnection))
            using (var newCommand = new SqlCommand(sql, newConnection))
            {
                if (parameters != null) newCommand.Parameters.AddRange(parameters);
                await newConnection.OpenAsync().ConfigureAwait(false);
                return await newCommand.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        #endregion
    }

    public class SqlReader
    {
        [JsonIgnore]
        private Core S;
        [JsonIgnore]
        private int _i = -1;
        public List<Dictionary<string, object>> Rows = new List<Dictionary<string, object>>();

        public SqlReader(Core FreightCore, string query = "", List<SqlParameter> parameters = null, string cachedName = "")
        {
            S = FreightCore;
            if(query == "") { return; }
            if(cachedName != "")
            {
                Rows = S.Server.GetFromCache(cachedName, new Func<List<Dictionary<string, object>>>(() =>
                {
                    var reader = S.Sql.ExecuteReader(query, parameters);
                    var rows = GetRows(reader);
                    reader.Dispose();
                    S.Sql.Close();
                    reader.Dispose();
                    return rows;
                }));
            }
            else
            {
                var reader = S.Sql.ExecuteReader(query, parameters);
                Rows = GetRows(reader);
                reader.Dispose();
                S.Sql.Close();
                reader.Dispose();
            }
        }

        public List<Dictionary<string, object>> GetRows(SqlDataReader reader)
        {
            var rows = new List<Dictionary<string, object>>();
            if (reader.HasRows == true)
            {
                Dictionary<string, object> item;
                string key = "";
                while (reader.Read() == true)
                {
                    item = new Dictionary<string, object>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        key = reader.GetName(i);
                        item.Add(key.ToLower(), reader[key] is DBNull ? null : reader[key]);
                    }
                    rows.Add(item);
                }
            }
            return rows;
        }

        public SqlReader GetReader(SqlDataReader reader)
        {
            var sql = new SqlReader(S);
            sql.Rows = sql.GetRows(reader);
            return sql;
        }

        public List<SqlReader> GetReaders(SqlDataReader reader)
        {
            var list = new List<SqlReader>();
            while (reader.HasRows)
            {
                list.Add(GetReader(reader));
                reader.NextResult();
            }
            return list;
        }

        public SqlReader GetReaderFromPosition(int start, int length = 0)
        {
            var rows = new List<Dictionary<string, object>>();
            for (var i = start; i < Rows.Count && (i < start + length - 1 || length == 0); i++)
            {
                rows.Add(Rows[i]);
                i++;
            }
            var reader = new SqlReader(S, "");
            reader.Rows = rows;
            return reader;
        }

        public bool HasRows
        {
            get
            {
                return Rows.Count > 0;
            }
        }

        public bool Read()
        {
            if (Rows.Count > _i + 1)
            {
                _i++; return true;
            }
            else { return false; }

        }

        public int Position
        {
            get { return _i; }
            set { _i = value; }
        }

        public void ResetPosition()
        {
            _i = -1;
        }

        public bool ContainsKey(string key)
        {
            return Rows[_i].ContainsKey(key.ToLower());
        }

        public object GetObj(string key)
        {
            if (Rows[_i].ContainsKey(key.ToLower()) == true) { return Rows[_i][key.ToLower()]; }
            return null;
        }

        public string Get(string key)
        {
            return (string)GetObj(key) ?? "";
        }

        public int GetInt(string key)
        {
            var obj = GetObj(key);
            if(obj == null) { return 0; }
            if(Type.GetTypeCode(obj.GetType()) == TypeCode.Int64)
            {
                return Convert.ToInt32(obj);
            }
            return (int)obj;
        }

        public int GetShort(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return 0; }
            return (short)obj;
        }

        public Int64 GetInt64(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return 0; }
            return (Int64)obj;
        }

        public bool GetBool(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return false; }
            if(obj.GetType() == typeof(bool)) { return (bool)obj; }
            return (int)obj == 1 ? true : false;
        }

        public double GetDouble(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return 0; }
            return (double)obj;
        }

        public decimal GetDecimal(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return 0; }
            return (decimal)obj;
        }

        public DateTime GetDateTime(string key)
        {
            var obj = GetObj(key);
            if(obj == null) { return DateTime.Now; }
            return (DateTime)obj;
        }

        public Byte[] GetBinary(string key)
        {
            var obj = GetObj(key);
            if (obj == null) { return new Byte[0]; }
            return (Byte[])obj;
        }
    }

    public static class SqlReaders
    {
        public static List<SqlReader> GetReaders(Core S, string sql, List<SqlParameter> parameters = null)
        {
            var sqlReader = new SqlReader(S);
            var list = new List<SqlReader>();
            var reader = S.Sql.ExecuteReader(sql, parameters);
            do
            {
                list.Add(sqlReader.GetReader(reader));

            } while (reader.NextResult());
            reader.Dispose();
            S.Sql.Close();
            return list;
        }
    }
    
    public class SqlQuery
    {
        protected Core S;

        public SqlQuery(Core WebsilkCore)
        {
            S = WebsilkCore;
        }
    }
}
