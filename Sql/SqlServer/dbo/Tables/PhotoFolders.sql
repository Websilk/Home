CREATE TABLE [dbo].[PhotoFolders]
(
	[folderId] INT NOT NULL PRIMARY KEY, 
    [websiteId] INT NULL, 
    [name] NVARCHAR(25) NULL, 
    [datecreated] DATETIME NULL
)

GO

CREATE INDEX [index_photoFolders] ON [dbo].[PhotoFolders] (websiteId)
