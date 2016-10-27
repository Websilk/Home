CREATE TABLE [dbo].[Login] (
    [datecreated] DATETIME       NOT NULL,
    [loginid]     NVARCHAR (10)  NOT NULL,
    [email]       NVARCHAR (100) NOT NULL,
    [hash]        NVARCHAR (100) NOT NULL,
    CONSTRAINT [PK_Login] PRIMARY KEY ([loginid])
);


GO

CREATE INDEX [index_login] ON [dbo].[Login] (datecreated DESC)
