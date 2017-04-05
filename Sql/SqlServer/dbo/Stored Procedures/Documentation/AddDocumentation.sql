CREATE PROCEDURE [dbo].[AddDocumentation]
	@path nvarchar(50),
	@title nvarchar(100),
	@keywords nvarchar(MAX)
AS
	INSERT INTO Documentation ([path], title, keywords) VALUES (@path, @title, @keywords)