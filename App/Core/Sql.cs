﻿using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
            cmd.CommandText = GetQuery(sql, parameters);
            reader = cmd.ExecuteReader();
            return reader;
        }

        public void ExecuteNonQuery(string sql, List<SqlParameter> parameters = null)
        {
            if (_started == false) { Start(); }
            cmd.CommandText = GetQuery(sql, parameters);
            cmd.ExecuteNonQuery();
        }

        public object ExecuteScalar(string sql, List<SqlParameter> parameters = null)
        {
            if (_started == false) { Start(); }
            cmd.CommandText = GetQuery(sql, parameters);
            return cmd.ExecuteScalar();
        }

        private string GetQuery(string sql, List<SqlParameter> parameters = null)
        {
            var q = sql;
            if(parameters != null)
            {
                if (parameters.Count > 0)
                {
                    foreach (var p in parameters)
                    {
                        q = q.Replace(p.Name, p.Value);
                    }
                }
            }
            return q;

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
            if (Util.Str.IsNumeric(s)) { 
            return int.Parse(reader[key].ToString());
            }
            return 0;
        }

        public Int64 GetInt64(string key)
        {
            string s = Get(key);
            if (Util.Str.IsNumeric(s))
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
        [JsonIgnore]
        private Core S;
        [JsonIgnore]
        private int _i = -1;
        public List<Dictionary<string, string>> Rows = new List<Dictionary<string, string>>();

        public SqlReader(Core WebsilkCore, string query, List<SqlParameter> parameters)
        {
            S = WebsilkCore;
            var q = query;
            //inject values into query (to prevent sql injection attacks)
            if(parameters.Count > 0)
            {
                foreach(var p in parameters)
                {
                    q = q.Replace(p.Name, p.Value);
                }
            }

            var reader = S.Sql.ExecuteReader(q);
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
                Dictionary<string, string> item;
                string key = "";
                while (reader.Read() == true)
                {
                    item = new Dictionary<string, string>();
                    for (int i= 0; i < reader.FieldCount; i++){
                        key = reader.GetName(i);
                        item.Add(key.ToLower(), reader[key].ToString());
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
            if(Rows[_i].ContainsKey(key.ToLower()) == true) { return Rows[_i][key.ToLower()]; }
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


    public enum enumSqlParameterType
    {
        isString = 0,
        isNumber = 1
    }

    public class SqlParameter
    {
        public string Name = "";
        private string _value = "";
        public int Length;
        public enumSqlParameterType Type = enumSqlParameterType.isString;

        public SqlParameter(string name, string value, int maxLength = 0, enumSqlParameterType type = enumSqlParameterType.isString)
        {
            Name = name;
            _value = value;
            Type = type;
            Length = maxLength;
        }

        public string Value
        {
            get
            {
                var quote = Type == enumSqlParameterType.isString ? "'" : "";
                return quote + CleanValue(_value) + quote;
            }
            set
            {
                _value = value;
            }
        }

        private string CleanValue(string value)
        {
            //prevent SQL injection
            //replace two (or more) single-quotes with a single-quote and then 
            //replace one single-quote with two single-quotes
            var v = value.Replace("''", "'").Replace("''","'").Replace("'","''"); 
            //truncate data if needed
            if(v.Length > Length && Length > 0) { v = v.Substring(0, Length - 1); }
            return v;
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
