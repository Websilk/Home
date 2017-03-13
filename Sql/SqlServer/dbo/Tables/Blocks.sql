CREATE TABLE [dbo].[Blocks]
(
	[blockId] INT NOT NULL PRIMARY KEY, 
    [websiteId] INT NOT NULL, 
    [area] NVARCHAR(16) NULL, 
    [name] NVARCHAR(32) NULL
)
