CREATE TABLE [dbo].[Photos]
(
    [websiteId] INT NOT NULL,
	[folderId] INT NOT NULL,
	[filename] NVARCHAR(15) NOT NULL PRIMARY KEY, 
    [uploadname] NVARCHAR(25) NULL,
    [width] INT NULL, 
    [height] INT NULL, 
    [datecreated] DATETIME NULL
)

GO

CREATE INDEX [index_photos] ON [dbo].[Photos] (websiteId, folderId)
