CREATE TABLE [dbo].[Documentation]
(
	[path] NVARCHAR(50) NOT NULL PRIMARY KEY, 
	[title] nvarchar(100) NOT NULL DEFAULT '',
    [keywords] NVARCHAR(MAX) NOT NULL DEFAULT ''
)
