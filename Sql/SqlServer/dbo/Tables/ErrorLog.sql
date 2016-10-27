CREATE TABLE [dbo].[ErrorLog] (
    [dateCreated] DATETIME       NOT NULL,
    [errorNumber] INT            NOT NULL,
    [userId]    INT            NULL,
    [message]      NVARCHAR (MAX) NULL, 
    [stackTrace] NVARCHAR(MAX) NULL, 
    CONSTRAINT [PK_ErrorLog] PRIMARY KEY ([dateCreated])
);


GO

CREATE INDEX [index_errorLog] ON [dbo].[ErrorLog] (dateCreated)
