using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace Websilk
{
    public enum enumSqlDataTypes
    {
        SqlClient = 0, MySql = 1
    }

    public class Sql
    {
        private Core S;
        private SqlConnection conn = new SqlConnection();
        private SqlCommand cmd = new SqlCommand();
        private bool _started = false;

        public SqlDataReader reader;
        public enumSqlDataTypes dataType;

        #region "SqlServer Engine"
        public Sql(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        private void Start()
        {
            if (_started == true) { return; }

            string active = S.Server.sqlActive;

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

            conn.ConnectionString = S.Server.sqlConnection;
            conn.Open();
            cmd.Connection = conn;
            cmd.CommandType = System.Data.CommandType.Text;
            _started = true;
        }

        public void Close()
        {
            if (_started == true) { conn.Close(); }
        }

        public SqlDataReader ExecuteReader(String sql)
        {
            if (_started == false) { Start(); }
            cmd.CommandText = sql;
            reader = cmd.ExecuteReader();
            return reader;
        }

        public void ExecuteNonQuery(String sql)
        {
            if (_started == false) { Start(); }
            cmd.CommandText = sql;
            cmd.ExecuteNonQuery();
        }

        public object ExecuteScalar(String sql)
        {
            if (_started == false) { Start(); }
            cmd.CommandText = sql;
            return cmd.ExecuteScalar();
        }

        #region "Get"
        public string Get(string key)
        {
            var v = reader[key];
            if (v is DBNull) { return ""; }
            string s = v.ToString();
            if (string.IsNullOrEmpty(s)) { return ""; }
            return (reader[key]).ToString();
        }

        public int GetInt(string key)
        {
            string s = Get(key);
            if (S.Util.Str.IsNumeric(s)) { 
            return int.Parse(reader[key].ToString());
            }
            return 0;
        }

        public Int64 GetInt64(string key)
        {
            string s = Get(key);
            if (S.Util.Str.IsNumeric(s))
            {
                return Int64.Parse(s);
            }
            return 0;
        }

        public bool GetBool(string key)
        {
            string s = Get(key);
            return bool.Parse(s);
        }

        public double GetDouble(string key)
        {
            string s = Get(key);
            return double.Parse(s);
        }

        public DateTime  GetDateTime(string key)
        {
            string s = Get(key);
            return DateTime.Parse(s);
        }
        #endregion

        #endregion

        #region "Encode / Decode"
        /// <summary>
        /// Encodes the the string so that it can be used for SQL 
        /// (removing any SQL injection attempts)
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public string Encode(string str)
        {
            return str.Replace("'","{q}");
        }

        public string Decode(string str)
        {
            return str.Replace("{q}","'");
        }
        #endregion
    }

    public class SqlReader
    {
        private Core S;
        private int _i = -1;
        public List<Dictionary<string, object>> Rows = new List<Dictionary<string, object>>();

        public SqlReader(Core WebsilkCore, string query)
        {
            S = WebsilkCore;
            var reader = S.Sql.ExecuteReader(query);
            switch(S.Sql.dataType){
                case enumSqlDataTypes.SqlClient:
                    ReadFromSqlClient(reader);
                    break;
                case enumSqlDataTypes.MySql:
                    ReadFromMySql(reader);
                    break;
            }
        }

        private void ReadFromSqlClient(SqlDataReader reader)
        {
            if(reader.HasRows == true)
            {
                Dictionary<string, object> item;
                string key = "";
                while (reader.Read() == true)
                {
                    item = new Dictionary<string, object>();
                    for (int i= 0; i < reader.FieldCount; i++){
                        key = reader.GetName(i);
                        item.Add(key.ToLower(), reader[key]);
                    }
                    Rows.Add(item);
                }
            }
            reader.Dispose();
        }

        private void ReadFromMySql(SqlDataReader reader)
        {
            //TODO: figure this out later
        }

        public bool Read()
        {
            if(Rows.Count > _i + 1)
            {
                _i++; return true;
            }else { return false; }

        }

        public int Position
        {
            get { return _i; }
            set { _i = value; }
        }

        public string Get(string key)
        {
            if(Rows[_i].ContainsKey(key.ToLower()) == true) { return Rows[_i][key.ToLower()].ToString(); }
            return "";
        }

        public int GetInt(string key)
        {
            string str = Get(key).ToLower().Replace("true", "1").Replace("false", "0");
            if(str == "") { str = "0"; }
            return int.Parse(str);
        }

        public Int64 GetInt64(string key)
        {
            string str = Get(key).ToLower().Replace("true", "1").Replace("false", "0");
            if (str == "") { str = "0"; }
            return Int64.Parse(str);
        }

        public bool GetBool(string key)
        {
            string str = Get(key).ToLower();
            if (str == "") { str = "0"; }
            return bool.Parse(str);
        }

        public double GetDouble(string key)
        {
            string str = Get(key).ToLower().Replace("true", "1").Replace("false", "0");
            if (str == "") { str = "0"; }
            return double.Parse(str);
        }

        public DateTime GetDateTime(string key)
        {
            string str = Get(key).ToLower();
            if (str == "") { return new DateTime(); }
            return DateTime.Parse(str);
        }
    }

    public class SqlQuery
    {
        protected Core S;
        protected enumSqlDataTypes dataType;

        public SqlQuery(Core WebsilkCore)
        {
            S = WebsilkCore;
            dataType = S.Sql.dataType;
        }
    }
}
