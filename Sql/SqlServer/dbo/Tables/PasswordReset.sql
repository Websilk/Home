CREATE TABLE [dbo].[PasswordReset] (
    [resetId]     NVARCHAR (10) NOT NULL,
    [email]       NVARCHAR (50) NOT NULL,
    [datecreated] DATETIME      NOT NULL, 
    CONSTRAINT [PK_PasswordReset] PRIMARY KEY ([email])
);


GO

CREATE INDEX [index_passReset] ON [dbo].[PasswordReset] (resetId)
