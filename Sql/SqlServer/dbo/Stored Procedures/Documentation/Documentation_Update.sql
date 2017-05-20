CREATE PROCEDURE [dbo].[Documentation_Update]
	@path nvarchar(100),
	@keywords nvarchar(MAX)
AS
	UPDATE Documentation SET keywords=@keywords WHERE [path]=@path