CREATE TABLE [dbo].[SecurityGroups]
(
	[groupId] INT NOT NULL PRIMARY KEY,
    [security]  BINARY(32) NULL, 
    [name] NVARCHAR(30) NOT NULL, 
    [dateCreated] DATETIME NOT NULL
)
